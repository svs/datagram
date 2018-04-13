ENV['KEEN_PROJECT_ID'] = Rails.application.secrets[:keen_id]
ENV['KEEN_WRITE_KEY'] = Rails.application.secrets[:keen_secret]

Rails.logger.info "Using Keen.io with #{ENV['KEEN_PROJECT_ID']}"

Rails.logger.info "#{Rails.env}"
