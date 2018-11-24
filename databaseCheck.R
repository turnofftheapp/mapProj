# https://www.r-bloggers.com/using-sqlite-in-r/
# https://github.com/r-dbi/RSQLite/issues/57#issuecomment-61533366
library("RSQLite")
library(DBI)
library(dplyr)
library(tm)
library(ggplot2)

# This method can be used to connect to another database online
# https://campus.datacamp.com/courses/importing-data-in-r-part-2/importing-data-from-databases-part-1?ex=1
con = dbConnect(RSQLite::SQLite(), dbname="/Users/maxcarey/Documents/proj/totago/totagoData.db")

# Read itenerary tabke if database into a dataframe
totagoData <- dbReadTable(con, "itenerary")

# Disconnect from database, close connection
dbDisconnect(con)

# See if there are any rows that are coded as not valid, but have both
totagoDataWrangled <- totagoData %>%
  filter(valid == 1, postalCode == "none") %>%
  group_by(startFromLocation) %>%
  count() %>%
  arrange(desc(n)) %>%
  head(20)

ggplot(totagoDataWrangled,aes(x = reorder(startFromLocation, -n), y = n)) +
  geom_bar(stat="identity") +
  theme(text = element_text(size=10), axis.text.x = element_text(angle = 90)) +
  ggtitle("Top 20")




