module Api
  module V1
    class DatagramsController < ApplicationController

      before_action :authenticate_user!, except: [:t]

      def index
        @datagrams = current_user.datagrams
        render json: @datagrams
      end

      def new
        render json: Datagram.new
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

      def t
        Rails.logger.info "#DatagramsController requested for #{params}"
        datagram = Datagram.find_by(token: params[:token]) rescue nil
        if datagram
          response = datagram.response_json(params: params[:params]).merge(params: params[:params])
          if params[:refresh]
            response = response.merge(refresh_channel: datagram.publish(params[:params] || {}))
          end
          render json: response
        else
          render json: {404 => "not found"}, status: 404
        end
      end

      def refresh
        @datagram = current_user.datagrams.find(params[:id]) rescue nil
        if @datagram
          channel = @datagram.publish(params[:params])
          render json: channel
        else
          render json: "not found", status: 404
        end
      end

      private

      def create_params
        params.require(:datagram).permit(:at, :frequency, :name).tap{|wl|
          wl[:watch_ids] = params[:datagram][:watch_ids]
          wl[:user_id] = current_user.id
        }
      end

    end

  end
end
