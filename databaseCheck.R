# https://www.r-bloggers.com/using-sqlite-in-r/
# https://github.com/r-dbi/RSQLite/issues/57#issuecomment-61533366
library("RSQLite")
library(RPostgreSQL)
library(DBI)
library(dplyr)
library(tm)
library(ggplot2)

# Get the password stored in a database
# from an environment variable
# https://cran.r-project.org/web/packages/httr/vignettes/secrets.html
dbPassword <- Sys.getenv("dbPassword")
dbUser <- Sys.getenv("dbUser")
dbHost <- Sys.getenv("dbHost")

db = dbConnect(PostgreSQL(),
               user=dbUser,
               password=dbPassword,
               host=dbHost,
               port=5432,
               dbname="totago")

dbExistsTable(db, "mixpanelmap")

df <- dbGetQuery(db, "SELECT * from mixpanelmap")