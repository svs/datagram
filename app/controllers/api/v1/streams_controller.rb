module Api
  module V1
    class StreamsController < ApplicationController
      respond_to :json

      before_action :authenticate_user!

      def index
        @streams = policy_scope(Stream)
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
