module Api
  module V1
    class StreamSinksController < ApplicationController
      def index
        stream_sinks = policy_scope(StreamSink).select(:id, :name, :stream_type)
          #StreamSinkPolicy::Scope.new(current_user, Datagram).resolve
        render json: stream_sinks
      end

      def create
        stream_sink = StreamSink.new(create_params)
        if stream_sink.save
          render json: {status: 'ok'}
        else
          render json: stream_sink, status: 422
        end
      end

      private

      def create_params
        params.require(:stream_sink).permit(:name, :stream_type)
      end

    end
  end
end
