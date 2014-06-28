module Api
  module V1
    class WatchesController < ApplicationController

      def index
        @watches = current_user.watches
        render json: @watches
      end


      def create
        @watch = Watch.new(watch_params.merge(user_id: current_user.id))
        if @watch.save
          render json: "ok"
        else
          render json: @watch.errors, status: 422
        end
      end

      def show
        @watch = current_user.watches.find(params[:id])
        render json: @watch.to_json
      end


      def update
        @watch = current_user.watches.find(params[:id])
        if @watch.update(watch_params)
          render json: "ok"
        else
          render json: @watch.errors, status: 422
        end
      end

      def details
        @watch = current_user.watches.find(params[:id]).responses.last
        render json: @watch.response_json["data"]
      end

      def preview
        ap "Params"
        ap params
        ap "Preview Params"
        ap preview_params
        @watch = Watch.new(preview_params)
        @watch.publish
        render json: "ok"
      end

      private

      def watch_params
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at).tap do |wl|
          wl[:data] = params[:watch][:data]
        end
      end

      def preview_params
        params[:watch][:data] = JSON.parse(params[:watch][:data]) if params[:watch][:data].is_a? String
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at, :id, :user_id, :webhook_url, :created_at, :updated_at).tap do |whitelisted|
          whitelisted[:data] = params[:watch][:data]
        end
      end

    end
  end
end
