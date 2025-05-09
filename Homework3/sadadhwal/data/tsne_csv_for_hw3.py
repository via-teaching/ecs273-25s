import numpy as np
import pandas as pd
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
import os

def main():
    # 1. Load stock data directly from CSV files
    stock_features = []
    tickers = []
    
    # Load all CSV files from the stockdata folder
    for filename in os.listdir('stockdata'):
        if filename.endswith('.csv'):
            ticker = filename.split('.')[0]  # Extract ticker name from filename
            file_path = os.path.join('stockdata', filename)
            
            try:
                # Read the CSV file
                df = pd.read_csv(file_path)
                
                # Select relevant columns
                feature_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
                
                # Check if all columns exist
                if all(col in df.columns for col in feature_cols):
                    # Calculate statistical features instead of using raw data
                    # This creates a fixed-length feature vector for each stock
                    features = []
                    
                    for col in feature_cols:
                        col_data = df[col].values
                        # Replace NaN with 0
                        col_data = np.nan_to_num(col_data)
                        
                        # Calculate statistics
                        features.extend([
                            np.mean(col_data),
                            np.std(col_data),
                            np.min(col_data),
                            np.max(col_data),
                            np.median(col_data)
                        ])
                    
                    stock_features.append(features)
                    tickers.append(ticker)
                    print(f"Processed {ticker} - features: {len(features)}")
                else:
                    print(f"Skipping {ticker} - missing required columns")
            except Exception as e:
                print(f"Error processing {ticker}: {e}")
    
    # 2. Convert to numpy array and handle NaNs
    features_array = np.array(stock_features)
    features_array = np.nan_to_num(features_array)
    
    print(f"Feature array shape: {features_array.shape}")
    
    # 3. Normalize the data
    scaler = StandardScaler()
    normalized_data = scaler.fit_transform(features_array)
    
    # 4. Apply t-SNE with parameters suitable for small datasets
    n_samples = normalized_data.shape[0]
    perplexity = min(5, max(1, n_samples - 1))  # Ensure perplexity is valid
    
    print(f"Using t-SNE with perplexity {perplexity} for {n_samples} samples")
    
    tsne = TSNE(
        n_components=2,
        perplexity=perplexity,
        n_iter=2000,
        random_state=42,
        init='pca'
    )
    
    tsne_results = tsne.fit_transform(normalized_data)
    
    # 5. Save to CSV
    tsne_df = pd.DataFrame(tsne_results, columns=['A', 'B'])
    tsne_df.to_csv('tsne.csv', index=False)
    print("t-SNE results saved to tsne.csv")
    
    # Optional: save with ticker names for reference
    tsne_with_tickers = pd.DataFrame({
        'ticker': tickers,
        'dim1': tsne_results[:, 0],
        'dim2': tsne_results[:, 1]
    })
    tsne_with_tickers.to_csv('tsne_with_tickers.csv', index=False)
    print("t-SNE results with tickers saved to tsne_with_tickers.csv")

if __name__ == '__main__':
    main()