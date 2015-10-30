require 'csv'
module Api
  module V1
    class DatagramsController < ApplicationController

      respond_to :xml, :json, :csv, :html, :png
      before_action :authenticate_user!, except: [:t]

      def index
        @datagrams = DatagramPolicy::Scope.new(current_user, Datagram).resolve
        render json: @datagrams.map{|d| d.as_json.except(:responses)}
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

      def update
        datagram = (policy_scope(Datagram).find(params[:id]) rescue nil)
        if datagram
          if datagram.update(update_params)
            render json: datagram
          else
            render json: datagram.errors, status: 422
          end
        end
      end


      def show
        datagram = policy_scope(Datagram).find(params[:id]) rescue nil
        if datagram
          render json: datagram
        else
          render json: "not found", status: 404
        end
      end

      def t
        params[:staleness] = nil if params[:staleness] == "any"
        if params[:token]
          datagram = Datagram.find_by(token: params[:token]) rescue nil
        elsif params[:api_key]
          datagram = User.find_by(token: params[:api_key]).datagrams.find_by(slug: params[:slug])
        end
        if datagram
          Mykeen.publish("datagram_view", {slug: datagram.slug, token: params[:token], api_key: params[:api_key]})
          rc = datagram.refresh_channel(params[:params])
          ds = DatagramService.new(datagram, params)
          response = ds.render(params[:views])
          respond_to do |format|
            format.json { render json: response }
            format.xml { render xml: response }
            format.html { render html: response }
            format.png { redirect_to response[:url] }
            format.csv {
              csv = CSV.generate do |f|
                response.each_with_index do |_r,i|
                  if i == 0
                    f << _r.keys
                  end
                  f << _r.values
                end
              end
              render plain: csv
            }
          end
        else
          render json: {404 => "not found"}, status: 404
        end
      end

      def refresh
        @datagram = policy_scope(Datagram).find(params[:id]) rescue nil
        if @datagram
          channel = @datagram.publish(params[:params])
          render json: channel
        else
          render json: "not found", status: 404
        end
      end

      private

      def create_params
        params.require(:datagram).permit(:at, :frequency, :name, :use_routing_key).tap{|wl|
          wl[:watch_ids] = params[:datagram][:watch_ids]
          wl[:user_id] = current_user.id
          wl[:publish_params] = params[:datagram][:publish_params]
          wl[:views] = params[:datagram][:views]
        }
      end

      def update_params
        create_params
      end



    end

  end
end
