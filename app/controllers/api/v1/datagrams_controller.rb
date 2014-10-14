module Api
  module V1
    class DatagramsController < ApplicationController

      before_action :authenticate_user!, except: [:t]
      def index
        @datagrams = DatagramPolicy::Scope.new(current_user, Datagram).resolve
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
          $statsd.increment('datagram.show')
          $statsd.increment("datagram.id.#{datagram.id}")
          render json: datagram
        else
          render json: "not found", status: 404
        end
      end

      def t
        sleep(3) if params[:sync]
        Rails.logger.info "#DatagramsController requested for #{params}"
        params[:staleness] = nil if params[:staleness] == "any"
        if params[:token]
          datagram = Datagram.find_by(token: params[:token]) rescue nil
          $statsd.increment("datagram.token.#{params[:token]}") if datagram
        elsif params[:api_key]
          datagram = User.find_by(token: params[:api_key]).datagrams.find_by(slug: params[:slug])
          if datagram
            $statsd.increment("datagram.api_key.#{params[:api_key]}")
          end
        end
        if datagram
          $statsd.increment("datagram.slug.#{datagram.slug}")
          $statsd.increment("datagram.t")
          rc = datagram.refresh_channel(params[:params])
          response = datagram.response_json(params: params[:params], as_of: params[:as_of], staleness: params[:staleness] ).
                     merge(refresh_channel: rc)
          if params[:refresh] && response[:responses].blank?
            if params[:sync]
              $redis.setex(rc, 10, 0)
            end
            datagram.publish(params[:params] || {})
            if params[:sync]
              done = false
              while (!done) do
                Rails.logger.info "#DatagramController waiting for refresh on #{rc}"
                v = $redis.get(rc)
                if v == nil
                  Rails.logger.info "#DatagramController TIMEOUT #{rc}"
                end
                done = v != "0"
                sleep 0.2
              end
              datagram.reset!
              response = datagram.response_json(params: params[:params], as_of: params[:as_of] ).
                merge(refresh_channel: rc)
            end
          end
          render json: response
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
        params.require(:datagram).permit(:at, :frequency, :name).tap{|wl|
          wl[:watch_ids] = params[:datagram][:watch_ids]
          wl[:user_id] = current_user.id
          wl[:publish_params] = params[:datagram][:publish_params]
        }
      end

      def update_params
        params.require(:datagram).permit(:at, :frequency, :name).tap{|wl|
          wl[:watch_ids] = params[:datagram][:watch_ids]
          wl[:user_id] = current_user.id
          wl[:publish_params] = params[:datagram][:publish_params]
        }
      end


    end

  end
end
