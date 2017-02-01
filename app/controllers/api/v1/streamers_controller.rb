module Api
  module V1
    class StreamersController < ApplicationController
      def destroy
        @streamer = (policy_scope(Streamer).find(params[:id]) rescue nil)
        if @streamer
          @streamer.destroy
          render json: {status: "ok"}
        else
          render json: {status: 404}, status: 404
        end
      end

      def refresh
        @streamer = (policy_scope(Streamer).find(params[:id]) rescue nil)
        if @streamer
          d = @streamer.publish!
          render json: {token: d}
        end
      end


    end


  end
end
