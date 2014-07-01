module Api
  module V1
    class DatagramsController < ApplicationController

      before_action :authenticate_user!

      def index
        @datagrams = current_user.datagrams
        render json: @datagrams
      end


      def create
        datagram = Datagram.new(create_params)
        if datagram.save
          render json: datagram
        else
          render json: datagram, status: 422
        end
      end

      def show
        datagram = current_user.datagrams.find(params[:id]) rescue nil
        if datagram
          render json: datagram
        else
          render json: "not found", status: 404
        end
      end

      private

      def create_params
        params.require(:datagram).permit(:at, :frequency, :name).tap{|wl|
          wl[:watches] = params[:datagram][:watches]
          wl[:user_id] = current_user.id
        }
      end

    end

  end
end
