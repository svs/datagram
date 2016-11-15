module Clients
  class GoogleDrive
    def initialize(url, payload)
      @url = url
      @user = User.find(payload.with_indifferent_access[:user_id])
    end

    def data
      data = session.spreadsheet_by_key(sheet_key).worksheet_by_gid(worksheet_gid).rows
      data[1..-1].map{|r| Hash[data[0].zip(r)]}
    end

    private

    attr_reader :url, :user

    def sheet_key
      url.split("/")[5]
    end

    def worksheet_gid
      url.split("/")[-1].split("=")[-1]
    end

    def session
      ap "Getting session..."
      return @session if @session
      session = ::GoogleDrive.login_with_oauth(token)
      begin
        session.spreadsheets
      rescue Exception => e
        ap e
        refresh_token!
        session = ::GoogleDrive.login_with_oauth(token)
      end
      @session = session
    end

    def token
      @token ||= user.google_token
    end

    def refresh_token!
      client = Google::APIClient.new
      client.authorization.client_id = Rails.application.secrets[:google_app_id]
      client.authorization.client_secret = Rails.application.secrets[:google_app_secret]
      client.authorization.grant_type = 'refresh_token'
      client.authorization.refresh_token = user.google_refresh_token
      t = client.authorization.fetch_access_token
      user.update(google_token: t["access_token"])
      user.reload
      @token = nil
    end


  end
end
