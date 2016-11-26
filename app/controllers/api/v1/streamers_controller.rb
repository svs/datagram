module Api
  module V1
    class StreamersController < ApplicationController
      def destroy
        @streamer = (policy_scope(Streamer).find(params[:id]) rescue nil)
        ap @streamer
        if @streamer
          @streamer.destroy
          render json: {status: "ok"}
        else
          render json: {status: 404}, status: 404
        end
      end
    end
  end
end
