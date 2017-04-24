module Api
  module V1
    class UsersController < ApplicationController
      def me
        @user = current_user
        render
      end
    end
  end
end
