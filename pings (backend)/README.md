# Pings - Solution

I have created the pings backend in NodeJs and MongoDb. The database is on a MongDb server on an Amazon EC2 instance. So it should be always available for testing unless I run out of free tier hours or you DDOS this auth-less API. Although in that case, your local copy of this api will probably bottleneck before Amazon feels a thing.

## Dependencies

This app depends on express and mongoose libraries for node. (Node 8, LTS)

`npm install`

## Running the solution

`node .`

## Why Node ?

I can't say it better than node themselves say it.

> "Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient"

This together with the asynchronous nature of the express and mongoose libraries means making APIs is a breeze.

## Why Mongo ?

I've used MongoDb, a NoSQL document based storage engine for this solution. I felt this was suitable as there is no relational data in this data model. The model can be described as "a device id having a list of pings", which is easily represented in a document based JSON/BSON format.

The db engine has been setup to index the device id making queries a lot faster when looking for a specific device.

I've also set it up to index pings which in theory should make filtering pings efficient. But this might blow up the size of the index in a production scenario where there are millions of pings. Also, I'm not sure how efficient traversal through an array of pings is in MongoDb. I don't have production experience to make any comments. 

A csv file probably would have sufficed for the scale of data in this tiny exercise. But I always like to engineer my solutions as close to production as possible within the limits of my knowledge. I really have no idea how distributed db clusters and high availiblity things work.

A simple table with a device_id and ping column on an SQL engine is probably faster at low loads but I feel like document dbs just scale better for bigger loads.

## Extending this exercise

I would probably take this opportunity to learn serverless applications by setting up this API on Amazon Lambda.
