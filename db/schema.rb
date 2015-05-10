# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150510145520) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_stat_statements"
  enable_extension "plpgsql"

  create_table "datagrams", force: :cascade do |t|
    t.string   "name",                  limit: 255
    t.integer  "watch_ids",                         array: true
    t.string   "at",                    limit: 255
    t.integer  "frequency"
    t.integer  "user_id"
    t.string   "token",                 limit: 255
    t.boolean  "use_routing_key"
    t.integer  "last_update_timestamp", limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "slug",                  limit: 255
    t.json     "publish_params"
  end

  create_table "sources", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.string   "url",        limit: 255
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "protocol"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                      default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
    t.string   "token",                  limit: 255
    t.integer  "linked_account_id"
    t.string   "role",                   limit: 255
    t.boolean  "use_routing_key"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "watch_responses", force: :cascade do |t|
    t.integer  "watch_id"
    t.integer  "datagram_id"
    t.integer  "status_code"
    t.datetime "response_received_at"
    t.integer  "round_trip_time"
    t.json     "response_json"
    t.json     "error_json"
    t.string   "signature",            limit: 255
    t.boolean  "modified"
    t.integer  "elapsed"
    t.json     "strip_keys"
    t.json     "keep_keys"
    t.integer  "started_at"
    t.integer  "ended_at"
    t.string   "token",                limit: 255
    t.boolean  "preview"
    t.integer  "timestamp",            limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.json     "params"
    t.datetime "report_time"
    t.json     "transform"
    t.integer  "bytesize"
    t.string   "refresh_channel",      limit: 255
    t.text     "error"
  end

  create_table "watches", force: :cascade do |t|
    t.integer  "user_id"
    t.json     "data"
    t.integer  "frequency"
    t.string   "at",                  limit: 255
    t.string   "name",                limit: 255
    t.string   "url",                 limit: 255
    t.string   "method",              limit: 255, default: "get"
    t.string   "webhook_url",         limit: 255
    t.string   "protocol",            limit: 255, default: "http"
    t.string   "token",               limit: 255
    t.json     "strip_keys"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.json     "keep_keys"
    t.string   "last_response_token", limit: 255
    t.boolean  "use_routing_key"
    t.string   "slug",                limit: 255
    t.json     "params"
    t.string   "report_time",         limit: 255
    t.json     "transform"
    t.integer  "source_id"
  end

end
