class WatchResponsesController < ApplicationController

protect_from_forgery :except => [:update]

  def update
    wr = WatchResponse.find(params[:token])
    data = params[:data].is_a?(String) ? JSON.parse(params[:data]) : params[:data]
    if wr.update(response_json: {data: data},
                        status_code: params[:status_code])

      begin
        Rails.logger.info "Pushing...."
        Pusher.trigger('stats', 'data', wr)
        Rails.logger.info "..done"
      rescue Pusher::Error
        Pusher.trigger('stats', 'data', {status: "push failed", token: wr.token})
      end
      respond_to do |format|
        format.json { "ok" }
        format.html { redirect_to watches_path }
      end
    else
      render "not allowed", status: 422
    end
  end

end
