import os
from io import BytesIO
import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, NoCredentialsError

from .config import settings


def _get_s3_client():
    if not settings.s3_enabled:
        return None
    return boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        config=Config(signature_version="s3v4"),
    )


async def upload_image_to_s3(file_obj, filename: str, content_type: str) -> str:
    """
    Upload a file-like object to S3 and return the public URL.
    Assumes bucket is private/public; URL points to S3 object path.
    """
    client = _get_s3_client()
    if not client:
        raise RuntimeError("S3 is not configured")

    data = await file_obj.read()
    buffer = BytesIO(data)

    key = f"uploads/{filename}"
    try:
        client.upload_fileobj(
            buffer,
            settings.s3_bucket,
            key,
            ExtraArgs={"ContentType": content_type},
        )
    except (BotoCoreError, NoCredentialsError) as exc:
        raise RuntimeError(f"S3 upload failed: {exc}") from exc

    region = settings.aws_region
    bucket = settings.s3_bucket
    # Standard S3 URL format
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"

