module Api
  module V1
    class StreamsController < ApplicationController
      respond_to :xml, :json, :csv, :html, :png
      before_action :authenticate_user!, except: [:t]

      def index
        @streams = StreamPolicy::Scope.new(current_user, Datagram).resolve
        render json: @streams.map{|d| d.as_json}
      end

    end
  end
end
