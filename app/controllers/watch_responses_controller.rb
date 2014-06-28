class WatchResponsesController < ApplicationController

protect_from_forgery :except => [:update]

  def update
    wr = WatchResponse.find_by(token: params[:token])
    data = params[:data].is_a?(String) ? JSON.parse(params[:data]) : params[:data]
    if wr.update(response_json: {data: data},
                        status_code: params[:status_code])

      begin
        Rails.logger.info "Pushing watch id: #{wr.watch_id}"
        Pusher.trigger('stats', 'data', {token: wr.token, modified: wr.modified})
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
