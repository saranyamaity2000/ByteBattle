#!/bin/bash

# Use the variable $S3_BUCKET_NAME (we will define this in compose)
awslocal s3 mb "s3://$S3_BUCKET_NAME"
echo "Bucket created: $S3_BUCKET_NAME"