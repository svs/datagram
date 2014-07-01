Rails.application.routes.draw do
  devise_for :users
  root to: "home#index"

  resources :watches
  resources :datagrams

  namespace 'api' do
    namespace 'v1' do
      resources :watch_responses
      resources :watches do
        member do
          put 'preview'
        end
      end
      resources :datagrams
    end
  end
end
