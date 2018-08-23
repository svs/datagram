require 'csv'
module Api
  module V1
    class DatagramsController < ApplicationController

      respond_to :xml, :json, :csv, :html, :png
      before_action :authenticate_user!, except: [:t]


      def index
        @datagrams = policy_scope(Datagram)
        #render json: @datagrams.map{|d| d.as_json.except(:responses)}
      end

      def new
        authorize Datagram
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
        datagram = Datagram.find(params[:id])
        if datagram
          authorize Datagram
          render json: datagram
        else
          skip_authorization
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
          if ["json","xml","csv","html","png"].include?(params[:format])
            ds = DatagramFetcherService.new(datagram, params)
            response = ds.render(params[:views])
            filename = ds.last_filename
          end
          if ["ag-grid","aggrid","pivot","flexmonster"].include?(params[:format])
            redirect_to url_for(params.merge("format" => "html")) and return
          end
          respond_to do |format|
            format.json { render json: response }
            format.xml { render xml: response }
            format.html {
              @url = url_for(params.merge("format" => "json", "host" => Rails.env.production? ? ENV['HOSTNAME'] : 'localhost:4000'))
              @v = last_view(datagram)
              @datagram = datagram
              ap @v.class
              ap @v.layout_file
              render template: "api/v1/datagrams/#{@v.template_file}", layout: @v.layout_file
            }
            format.png {
              if response.is_a?(Hash)
                redirect_to(response[:url])
              elsif response.is_a?(String)
                x = SecureRandom.urlsafe_base64(5)
                html = render_to_string(inline:response, layout: 'html')
                File.open("/tmp/#{x}.html","w") {|f| f.write(html) }
                `wkhtmltoimage /tmp/#{x}.html /tmp/#{x}.png`
                s3 = Aws::S3::Resource.new
                obj = s3.bucket('dg-nv-tmp').object(filename)
                obj.upload("/tmp/#{x}.png")
                redirect_to "https://s3.amazonaws.com/dg-nv-tmp/#{filename}"

              else
                send_file response, type: 'image/png', disposition: 'inline'
              end
#              @data = response
#              render
            }
            format.csv {
              csv = CSV.generate do |f|
                response.each_with_index do |_r,i|
                  _r = _r
                  if i == 0
                    f << _r.keys
                  end
                  f << _r.values
                end
              end
              render plain: csv
            }
            format.uri {
              render plain: response[:url]
            }
          end
        else
          render json: {404 => "not found"}, status: 404
        end
      end

      def refresh
        @datagram = policy_scope(Datagram).find(params[:id]) rescue nil
        if @datagram
          channel = @datagram.publish(params[:param_set] || params[:params])
          render json: {token: channel}
        else
          render json: "not found", status: 404
        end
      end

      private

      def create_params
        params.require(:datagram).permit(:at, :frequency, :name, :use_routing_key, :archived, :description, streamers_attributes: [:stream_sink_id, :view_name, :param_set, :format, :frequency]).tap{|wl|
          wl[:watch_ids] = params[:datagram][:watch_ids] if params[:datagram][:watch_ids]
          wl[:user_id] = current_user.id
          wl[:publish_params] = params[:datagram][:publish_params] if params[:datagram][:publish_params]
          wl[:views] = params[:datagram][:views] if params[:datagram][:views]
          wl[:param_sets] = params[:datagram][:param_sets] if params[:datagram][:param_sets]
        }
      end

      def update_params
        create_params
      end

      def last_view(datagram)
        v = DatagramViewLoader.new(datagram, Array(params[:views])[-1])
        v.load
      end

      def user_not_authorized
        raise
      end

    end

  end
end
