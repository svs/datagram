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
        ap preview_params
        ap params
        @watch = Watch.new(preview_params)
        @watch.publish
        render json: "ok"
      end

      private

      def watch_params
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at, :data)
      end

      def preview_params
        params[:watch][:data] = JSON.parse(params[:watch][:data]) if params[:watch][:data].is_a? String
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at, :id, :user_id, :webhook_url, :created_at, :updated_at, :data => [:query])
      end

    end
  end
end
