#!/bin/bash

# Check if the bucket already exists
if awslocal s3api head-bucket --bucket "$S3_BUCKET_NAME" 2>/dev/null; then
    echo "Bucket '$S3_BUCKET_NAME' already exists. Skipping creation to preserve persisted data."
else
    awslocal s3 mb "s3://$S3_BUCKET_NAME"
    echo "Bucket created: $S3_BUCKET_NAME"
fi