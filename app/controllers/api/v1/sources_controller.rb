module Api
  module V1
    class SourcesController < ApplicationController


      def index
        @sources = SourcePolicy::Scope.new(current_user, Source).resolve
        render json: @sources
      end

    end
  end
end
