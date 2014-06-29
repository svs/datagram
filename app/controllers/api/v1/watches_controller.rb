module Api
  module V1
    class WatchesController < ApplicationController

      def index
        @watches = current_user.watches
        render json: @watches
      end

      def new
        @watch = Watch.new
        render json: @watch
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
        if params[:id].to_i > 0
          watch = current_user.watches.find(params[:id])
          render json: watch.to_json
        else
          watch = current_user.watches.find_by(token: params[:id])
          response = WatchResponse.where(watch_id: watch.id).last
          if params[:all]
            render json: response
          else
            render json: response.response_json
          end
        end
      end


      def update
        if params[:id] == "preview"
          @watch = Watch.new(preview_params.except(:id))
          @watch.publish
          render json: "ok" and return
        else
          @watch = current_user.watches.find(params[:id])
          if @watch.update(watch_params)
            render json: @watch
          else
            render json: @watch, status: 422
          end
        end
      end

      def details
        @watch = current_user.watches.find(params[:id]).responses.last
        render json: @watch.response_json["data"]
      end

      def preview
        @watch = Watch.new(preview_params)
        @watch.publish
        render json: "ok" and return
      end

      private

      def watch_params
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at, :strip_keys).tap do |wl|
          wl[:data] = params[:watch][:data]
          wl[:strip_keys] = params[:watch][:strip_keys]
        end
      end

      def preview_params
        params[:watch][:data] = JSON.parse(params[:watch][:data]) if params[:watch][:data].is_a? String
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at, :id, :user_id, :webhook_url, :created_at, :updated_at, :strip_keys).tap do |whitelisted|
          whitelisted[:data] = params[:watch][:data]
          whitelisted[:strip_keys] = params[:watch][:strip_keys]
        end
      end

    end
  end
end
