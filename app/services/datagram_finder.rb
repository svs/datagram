class DatagramFinder

  def self.all
    Rails.logger.info("#DatagramFinder starting")
    ds = Datagram.where('archived IS DISTINCT FROM true').all.map{|d|
      (d.param_sets || {}).select{|n,v|
        (v["frequency"].to_i > 0 || !p["at"].blank?) rescue nil
      }.map{|k,m| o = OpenStruct.new(m.merge("id" => d.id)); o.frequency = o.frequency.to_i; o}
    }.select{|k| !k.blank?}.flatten.tap{|x|
      Rails.logger.info("#DatagramFinder found #{x.count} datagrams with refresh turned on")
      x.map{|y| Rails.logger.info "#DatagramFinder -- #{Datagram.find(y.id).name} #{y.name} #{y.frequency}"}
    }
  end

end
