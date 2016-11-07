Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'registrations',  omniauth_callbacks: 'users/omniauth_callbacks' }
  root to: "home#index"
  get '/prof', to: 'home#prof', as: 'prof'
  get '/profile', to: 'users#profile'
  resources :watches
  resources :datagrams
  resources :sources
  resources :streams
  namespace 'api' do
    namespace 'v1' do
      resources :streams
      resources :watch_responses, constraints: {id: /[^\/]+/}
      resources :watches do
        member do
          put 'preview'
        end
      end
      resources :datagrams, :defaults => { :format => 'json' } do
        member do
          put 'refresh'
        end
      end
      resources :sources
      get 'd/:token', to: 'datagrams#t', as: 'd'
      get 't/:slug', to: 'datagrams#t', as: 't', defaults: { format: "json"}
      get 'w/:token', to: 'watches#t', as: 'w', defaults: { format: "json"}
      get 'wr/:token', to: 'watch_responses#t', as: 'wr', defaults: { format: "json"}
      put 'w/preview', to: 'watches#preview', as: 'p', defaults: { format: "json"}
      post 'wizard', to: 'datagrams#wizard', as: 'wizard', defaults: {format: "json"}
    end
  end
end
