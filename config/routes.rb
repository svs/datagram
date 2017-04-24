Rails.application.routes.draw do
  devise_for :users, skip: [:registrations], controllers: {  omniauth_callbacks: 'users/omniauth_callbacks' }
  root to: "home#index"
  get '/prof', to: 'home#prof', as: 'prof'
  get '/profile', to: 'users#profile'
  get '/ro', to: 'ro#index', as: 'ro'
  resources :watches
  resources :datagrams
  resources :sources
  resources :streams
  namespace 'api' do
    namespace 'v1' do
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
      resources :stream_sinks
      resources :streamers do
        member do
          put 'refresh'
        end
      end
      resources :streams, defaults: { format: "json"}
      get 'd/:token', to: 'datagrams#t', as: 'd'
      get 't/:slug', to: 'datagrams#t', as: 't', defaults: { format: "json"}
      get 'w/:token', to: 'watches#t', as: 'w', defaults: { format: "json"}
      get 'profile', to: 'users#me', as: 'profile', defaults: { format: "json"}
    end
  end
end
