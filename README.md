# TOTAGO Destination Mapping Project

## Installation (Getting Up and Running)
1. Clone this repository
2. On terminal, run `pip3 install -r requirements.txt`
3. Initialize the database `python3 database_setup.py`
3. Install Jupyter notebooks: `pip3 install jupyter`

## Set up environment variables
Good tutorial: https://www.idiotinside.com/2015/05/10/python-auto-generate-requirements-txt/

1. Create a file in the working directory called "app-env" `touch app-env`
2. In this file add the following three lines replacing the text between quotes with your API keys:

    export api_secret="[INSERT MIXPANEL API SECRET]"  
    export token="[INSERT MIXPANEL TOKEN]"  
    export my_key="[INSERT GOOGLE MAPS GEOCODE API KEY]"  

3. In the terminal run `source app-env` to activate your environment variables (Note: you must run the `source` command in the same terminal before launching Jupyter Notebooks in order for the geocode()function to work within the data wrangling script)

## Get the Data
1. <strong>Using python 2</strong>, run the script `python get_data.py`

## Run the server
1. `python3 server.py`

## Populate the database
1. Open jupyter notebook, in terminal run: `jupyter notebook`
2. Open the notebook: `wrangleDataAndFillDb`
3. Run the entire script

## Check the database entries you have added at `http://localhost:8000/api/`

## To Check the Accuracy of the geocode() function

1. The second-to-last section in notebook creates a random subset from the entire dataset. You can change the size of this subset by modifying the parameter to the sample() function in this line: `sampleDf = df.sample(20)`

2. Then run the last section of the notebook (the for-loop which calls the `geocode()` funtion to add these entries to the database).

3. The geocode() function will output the entire JSON response from google as well as the the dictionary that will be returned to the main script. You will see this output at the end of the notebook.