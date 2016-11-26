module Api
  module V1
    class StreamSinksController < ApplicationController
      def index
        stream_sinks = StreamSinkPolicy::Scope.new(current_user, Datagram).resolve.select(:id, :name, :stream_type)
        render json: stream_sinks
      end
    end
  end
end
