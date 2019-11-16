from mixpanel_api import Mixpanel
import os

# Get mixpanel credentials from environment variables
# Tutorial for using environment variables: https://medium.freecodecamp.org/how-to-securely-store-api-keys-4ff3ea19ebda
API_SECRET = os.environ['api_secret']
TOKEN = os.environ['token']

# Create mixpanel object passing in credentials
mixpanel = Mixpanel(API_SECRET, token=TOKEN)

# Export all generated itenary
mixpanel.export_events('generated_itineraries.csv',{'from_date':'2011-07-11','to_date':'2019-11-13','event':'["Generated itineraries"]'}, format = "csv")
