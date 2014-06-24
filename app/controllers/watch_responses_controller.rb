class WatchResponsesController < ApplicationController

protect_from_forgery :except => [:update]

  def update
    wr = WatchResponse.find(params[:token])
    if wr.update(response_json: {data: JSON.parse(params[:data])},
                        status_code: params[:status_code])
      respond_to do |format|
        format.json { "ok" }
        format.html { redirect_to watches_path }
      end
    else
      render "not allowed", status: 422
    end
  end

end
