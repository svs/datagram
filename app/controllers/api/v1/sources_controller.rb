module Api
  module V1
    class SourcesController < ApplicationController

      def create
        @source = Source.create(source_params.merge(user_id: current_user.id))
        if @source
          render json: "200"
        else
          render json: @source.errors, status: 422
        end
      end


      def index
        @sources = SourcePolicy::Scope.new(current_user, Source).resolve
        render json: @sources
      end

      def show
        render json: policy_scope(Source).find(params[:id])
      end

      def new
        @source = Source.new
        render json: @source
      end

      def update
        source = policy_scope(Source).find(params[:id])
        if source
          if source.update(source_params)
            render json: source
          else
            render json: source.errors, status: 422
          end
        else
          render json: {}, status: 404
        end
      end

      private

      def source_params
        params.require(:source).permit(:name, :url)
      end

    end
  end
end
