# AWS::S3::Base.establish_connection!(
#   :access_key_id     => Rails.application.secrets[:aws_key],
#   :secret_access_key => Rails.application.secrets[:aws_secret]
# )

Aws.config.update(
  {
    credentials: Aws::Credentials.new(Rails.application.secrets[:aws_key], Rails.application.secrets[:aws_secret])
  }
)
