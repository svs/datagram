module Api
  module V1
    class StreamSinksController < ApplicationController
      def index
        stream_sinks = policy_scope(StreamSink).select(:id, :name, :stream_type)
          #StreamSinkPolicy::Scope.new(current_user, Datagram).resolve
        render json: stream_sinks
      end
    end
  end
end
