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
dbPassword <- Sys.getenv("my_password")

db = dbConnect(PostgreSQL(),
               user="maxcarey",
               password=dbPassword,
               host="localhost",
               port=5432,
               dbname="totago")

dbExistsTable(db, "itenerary")

df <- dbGetQuery(db, "SELECT * from itenerary")
