library(tidyverse)
library(tidyverse)
library(httr)
library(jsonlite)

generated_itineraries <- read.csv("~/Documents/proj/mapProj/generated_itineraries.csv")
datos <- generated_itineraries
remove(generated_itineraries)
datos[] <- lapply(datos, as.character)

path <- "https://www.totago.co/api/v1/destinations.json?publication_stage=verified&limit=1000"
request <- GET(url = path)
response <- content(request, as = "text", encoding = "UTF-8")
destinations <- fromJSON(response, flatten = TRUE) %>% 
  data.frame()


destinations <- destinations %>%
  select(destinations.id, destinations.name) %>%
  # Trim trailing white space from some of the strings
  mutate(destinations.name = str_trim(destinations.name)) %>%
  arrange(desc(destinations.name))

# datos <- datos %>%
#   select(startFromLocation, destination_id, selectedDestination_id, selectedDestination_name)

datos <- datos %>%
  # For those cases in which the column destination_id contains at least a one charcter vector, replace the selected Destination column with this row
  mutate(selectedDestination_name = ifelse(grepl("\\D", destination_id), destination_id, selectedDestination_name)) %>%
  # For those cases in which destination_id contains only numbers, replace selectedDestinationID with this value
  mutate(selectedDestination_id = ifelse(!grepl("\\D", destination_id), destination_id, selectedDestination_id))

# Drop  destination_id column
#datos <- datos %>%
#  #filter(user_id==827) %>%
#  select(startFromLocation, selectedDestination_id, selectedDestination_name)


# Fix some of the column names:
datos <- datos %>%
  mutate(selectedDestination_name = ifelse(selectedDestination_name == "Poo Poo Point (High School Trail)", "Poo Poo Point",
                                    ifelse(selectedDestination_name == "Squak Mountain", "Squak Mountain Traverse (through hike)",
                                    ifelse(selectedDestination_name == "Debbie's View on Squak Mountain", "Squak Mountain Traverse (through hike)",
                                    ifelse(selectedDestination_name == "Mount Si - Trailhead Direct", "Mount Si",
                                    ifelse(selectedDestination_name == "Mt Teneriffe", "Mount Teneriffe",
                                    ifelse(selectedDestination_name == "Mailbox Peak - Old Trail", "Mailbox Peak",
                                    ifelse(selectedDestination_name == "Poo Poo Point (via Chirico Trail)", "Poo Poo Point - Chirico Trail", selectedDestination_name))))))))


# If there is a selected destination name but no destination id:
getDestinationName <- function(destinationID, destinationName) {
  
  # In the case there already is a destination name just return that
  if(!destinationName=='') {
    return(destinationName)
  }
  
  # In the case that the destination ID is blank
  # That means both of these are blank anyway so just return
  # blank
  if(destinationID =="") {
    return("")
  }
  
  # In the other case, find the destinationName and return it
  destinations %>%
    filter(destinations.id == destinationID) -> localData
  destinationNameFound <- localData[1,2]
  cat(destinationNameFound)
  return(destinationNameFound)
}


# If there is a selected destination name but no destination id:
getDestinationID <- function(destinationName, destinationID) {
  
  # In the case there already is a destination id just return that
  if(!destinationID=='') {
    return(destinationID)
  }
  
  # In case the destination name is blank
  # Just return both
  if(destinationName =="") {
    return("")
  }
  
  destinations %>%
    filter(destinations.name == destinationName) -> localData
  destinationIDFound <- localData[1,1]
  cat(destinationIDFound)
  return(destinationIDFound)
  
}

datos$selectedDestination_name <- mapply(getDestinationName, datos$selectedDestination_id, datos$selectedDestination_name)
datos$selectedDestination_id <- mapply(getDestinationID, datos$selectedDestination_name, datos$selectedDestination_id)


write_csv(datos, path="./modified_iten.csv")
