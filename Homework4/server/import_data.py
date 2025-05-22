import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_ccc

stock_name_collection = db.get_collection("stock_list")

async def clear_all_collections():
    """clear all collections in the database"""
    await db.stockdata.delete_many({})
    await db.stocknews.delete_many({})
    await db.tsne.delete_many({})
    logger.info("Successfully cleared all collections.")

async def import_stockdata():
    """Import stock data"""
    logger.info("Importing stock data...")

    folder = "data/stockdata"
    
    if not os.path.exists(folder):
        logger.error(f"❌ Error: {folder} folder does not exist.")
        return

    csv_files = [f for f in os.listdir(folder) if f.endswith(".csv")]
    
    if not csv_files:
        logger.warning(f"⚠️ Alert: {folder} no csv file in this floder")
        return

    
    for file in csv_files:
        try:
            ticker = file[:-4]
            file_path = os.path.join(folder, file)
        
            df = pd.read_csv(file_path)

            required_cols = ['Date', 'Open', 'High', 'Low', 'Close']
            missing_cols = [col for col in required_cols if col not in df.columns]
            
            if missing_cols:
                logger.warning(f"    ❌ Missing column: {missing_cols}, skipping {file}")
                continue
            
            df = df.dropna(subset=required_cols)
            try:
                df['Date'] = pd.to_datetime(df['Date'], utc=True).dt.tz_convert(None).dt.strftime('%Y-%m-%d')
            except Exception as e:
                logger.warning(f"    ❌ Error: {e}")
                continue
            
            # Descending order by date
            df = df.sort_values('Date')
            
            # StockModelV2 format
            stock_series = []
            for _, row in df.iterrows():
                try:
                    stock_unit = {
                        "date": row['Date'],
                        "Open": float(row['Open']),
                        "High": float(row['High']),
                        "Low": float(row['Low']),
                        "Close": float(row['Close'])
                    }
                    stock_series.append(stock_unit)
                except (ValueError, TypeError) as e:
                    logger.warning(f"⚠️ Alert: {e}")
                    continue
            
            if not stock_series:
                continue
            
            # Final format StockModelV2 format
            stock_data = {
                "name": ticker,
                "stock_series": stock_series
            }
            
            # insert into MongoDB
            await db.stockdata.insert_one(stock_data)
            
            
        except Exception as e:
            logger.warning(f"    ❌ Failed to process {file}: {e}")
            continue

async def import_stocknews():
    """Import stock news data (with flexible filename parsing)"""
    root = "data/stocknews"
    logger.info("📥 Importing stock news data...")
    if not os.path.exists(root):
        logger.error(f"❌ Error: {root} folder does not exist.")
        return
    
    total_news = 0
    skipped = 0
    failed = 0

    for stock_ticker in os.listdir(root):
        stock_folder = os.path.join(root, stock_ticker)
        if not os.path.isdir(stock_folder):
            continue

        for file in os.listdir(stock_folder):
            if not file.endswith(".txt"):
                continue

            try:
                full_path = os.path.join(stock_folder, file)
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()

                filename = file.replace(".txt", "")
                parts = filename.split("_")


                raw_date = parts[0].replace("-", "")  
                try:
                    # print("🟣",raw_date)
                    date_obj = datetime.strptime(raw_date, "%Y%m%d")
                    formatted_date = date_obj.strftime("%Y-%m-%d")
                except ValueError:
                    formatted_date = "2025-01-01"
                    logger.warning(f"  ⚠️ Invalid date in filename: {parts[0]}")


                title_parts = parts[2:] if len(parts) >= 3 else parts[1:]
                title = " ".join(title_parts).replace("  ", " ").strip()

                news_doc = {
                    "stock": stock_ticker,
                    "date": formatted_date,
                    "title": title,
                    "content": content
                }
                # print("🟠",news_doc)
                await db.stocknews.insert_one(news_doc)
                total_news += 1

            except Exception as e:
                failed += 1
                logger.error(f"  ❌ Failed to process {file}: {e}")

    logger.info(f"✅ Imported {total_news} news articles.")
    logger.info(f"⚠️ Skipped: {skipped}, ❌ Failed: {failed}")


async def import_tsne():
    """Import t-SNE data"""
    logger.info("Importing t-SNE data...")
    path = "data/tsne.csv"
    
    if not os.path.exists(path):
        logger.error(f"❌ Error: {path} file does not exist.")
        return
    
    try:
        df = pd.read_csv(path)
        records = df.to_dict("records")
        await db.tsne.insert_many(records)
        logger.info(f"✅ Successfully import t-SNE data: {len(records)} numbers of records")
    except Exception as e:
        print(f"Failed to import tsne.csv: {e}")

async def verify_data():
    """Verify the data in the database"""
    logger.info("Verifying data...")
    try:
        # 1. Check Stock Data
        stock_data_count = await db.stockdata.count_documents({})
        logger.info(f"    1. We have {stock_data_count} numbers of Stock Data")
        
        # 2. Check Stock News
        news_count = await db.stocknews.count_documents({})
        logger.info(f"    2. We have {news_count} numbers of Stock News")

        # 3. Check t-SNE data
        tsne_count = await db.tsne.count_documents({})
        logger.info(f"    3. We have {tsne_count} numbers of t-SNE data")
        
        if tsne_count > 0:
            sample_tsne = await db.tsne.find({}).limit(5).to_list(5)
            logger.info(f"        Sample t-SNE data:")
            for item in sample_tsne:
                logger.info(f"         • {item.get('ticker', 'Unknown')}: ({item.get('x', 0):.2f}, {item.get('y', 0):.2f})")

        
    except Exception as e:
        logger.error(f"❌ Error when validating data: {e}")

async def main():
    """main function"""
    print(f"Database: {db.name}")
    
    try:
        clear = input("Check if needed to clear the database？(y/N): ").lower().strip()
        if clear == 'y':
            await clear_all_collections()
        
        # import data
        await import_stockdata()
        await import_stocknews()
        await import_tsne()
        
        # validate data
        await verify_data()
        
        logger.info("✅ Successfully imported data")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")

    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
