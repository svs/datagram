Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'registrations' }
  root to: "home#index"

  resources :watches
  resources :datagrams

  namespace 'api' do
    namespace 'v1' do
      resources :watch_responses, constraints: {id: /[^\/]+/}
      resources :watches do
        member do
          put 'preview'
        end
      end
      resources :datagrams do
        member do
          put 'refresh'
        end
      end
      get 'd/:token', to: 'datagrams#t'
    end
  end
end
