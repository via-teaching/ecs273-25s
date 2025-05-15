# ECS 273 HW4
Garrick Chan

garchan@ucdavis.edu

924171125

## Academic Integrity Acknowledgement
Google Gemini in Google search results and ChatGPT were used to learn about the existence of functions in various classes, modules, and packages.

## Server Side
1. `cd` into `server`. The import script will not work if run in a different working directory.
2. If packages are not already installed in the working environment, run `pip install -r requirements.txt`.
3. Run `python ./import_data.py`. (Assuming the local database is running)
4. Run `uvicorn main:app --reload --port 8000`.

## Client Side
Run the following in another terminal:
```shell
cd client
npm install
npm run dev
```
