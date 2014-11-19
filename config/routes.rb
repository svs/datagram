Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'registrations' }
  root to: "home#index"
  get '/prof', to: 'home#prof', as: 'prof'
  get '/profile', to: 'users#profile'
  resources :watches
  resources :datagrams
  resources :sources
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
      resources :sources
      get 'd/:token', to: 'datagrams#t', as: 'd'
      get 't/:slug', to: 'datagrams#t', as: 't'
    end
  end
end
