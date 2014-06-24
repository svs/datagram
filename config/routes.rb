Rails.application.routes.draw do
  devise_for :users
  root to: "home#index"

  resources :watches
  match '/watch_responses/:token', to: 'watch_responses#update', via: :put
end
