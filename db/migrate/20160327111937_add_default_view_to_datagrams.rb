class AddDefaultViewToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :default_view, :json
    add_column :datagrams, :default_view_format, :string
    add_column :datagrams, :default_view_url, :string
    add_column :datagrams, :default_view_body, :text
  end
end
