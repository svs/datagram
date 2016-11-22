module Api
  module V1
    class WatchesController < ApplicationController
      before_action :authenticate_user!, except: [:t]
      respond_to :xml, :json, :csv, :html, :png

      def index
        @watches = policy_scope(Watch)
        render json: @watches
      end

      def new
        @watch = Watch.new
        render json: @watch
      end

      def create
        ap watch_params
        result = WatchCreatorService.new(watch_params.merge(user_id: current_user.id), params["asDatagram"]).save
        if result[:watch].id
          render json: result
        else
          render json: result[:watch].errors, status: 422
        end
      end

      def show
        if (Integer(params[:id]) rescue nil)
          watch = policy_scope(Watch).find(params[:id])
          render json: watch.to_json
        else
          watch = current_user.watches.find_by(token: params[:id])
          response = watch.last_good_response
          render json: response
        end
      end


      def update
        if params[:id] == "preview"
          @watch = Watch.new(preview_params.except(:id).merge(user_id: current_user.id))
          @watch.publish
          render json: {status: "ok"} and return
        else
          ap params
          ap "---"
          ap watch_params
          @watch = policy_scope(Watch).find(params[:id])
          if @watch.update(watch_params)
            render json: @watch
          else
            render json: @watch, status: 422
          end
        end
      end

      def details
        @watch = policy_scope(Watch).find(params[:id]).responses.last

        render json: @watch.response_json["data"]
      end

      def preview
        @watch = Watch.new(preview_params.merge(user_id: current_user.id))
        token = @watch.publish(preview: true)
        render json: {token: token} and return
      end

      def t
        @watch = Watch.find_by(token: params[:token])
        respond_to do |format|
          format.json {
            render json: @watch.last_good_response.response_json
          }
          format.xml {
            render xml: @watch.last_good_response.response_json
          }
        end

      end

      private

      def watch_params
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at, :strip_keys, :use_routing_key, :source_id).tap do |wl|
          wl[:data] = params[:watch][:data]
          wl[:strip_keys] = params[:watch][:strip_keys]
          wl[:keep_keys] = params[:watch][:keep_keys]
          wl[:params] = params[:watch][:params]
          wl[:transform] = params[:watch][:transform]
          wl[:report_time] = params[:watch][:report_time]
        end
      end

      def preview_params
        params[:watch][:data] = JSON.parse(params[:watch][:data]) if params[:watch][:data].is_a? String
        params.require(:watch).permit(:name, :url, :method, :protocol, :frequency, :at, :id, :user_id, :webhook_url, :created_at, :updated_at, :strip_keys, :use_routing_key, :source_id).tap do |whitelisted|
          whitelisted[:data] = params[:watch][:data]
          whitelisted[:strip_keys] = params[:watch][:strip_keys]
          whitelisted[:keep_keys] = params[:watch][:keep_keys]
          whitelisted[:params] = params[:watch][:params]
          whitelisted[:transform] = params[:watch][:transform]
          whitelisted[:report_time] = params[:watch][:report_time]
        end
      end

    end
  end
end
