Rails.application.routes.draw do
  devise_for :users
  root to: "home#index"

  resources :watches
  match '/watch_responses/:token', to: 'watch_responses#update', via: :put

  namespace 'api' do
    namespace 'v1' do
      resources :watches do
        member do
          put 'preview'
        end
      end
    end
  end
end
