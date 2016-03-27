class UpdateDatagrams < ActiveRecord::Migration
  def change
    Datagram.all.each do |d|
      d.publish_params = d.publish_params ? (d.publish_params.reduce({}) {|a,i| a = a.merge(i[1])}) : nil
      d.save
    end
  end
end
