import csv

f = open("destinations_mapping_Jul-30-18.csv")

reader = csv.reader(f)


destinations = {}


# The index at the end of the for loop just skips the first row which is the header in the csv file
next(reader)
for row in reader:
    destinations[row[0]] = {'name':row[1]}

print(destinations['168']['name'])