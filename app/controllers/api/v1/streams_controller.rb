module Api
  module V1
    class StreamsController < ApplicationController
      respond_to :json

      before_action :authenticate_user!, except: [:t]

      def index
        skip_policy_scope
        @streams = StreamPolicy::Scope.new(current_user, Datagram).resolve
        render json: @streams.map{|d| d.as_json}
      end

      def show
        @stream_sink = StreamSink.where(token: params[:id]).first
        @streamers = Streamer.where(stream_sink: @stream_sink)
        ap @stream
        authorize @stream_sink
      end

    end
  end
end
