"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import OfferModal from "../../components/OfferModal";
import {getSupabaseClient} from "../../lib/supabase";
import {cardFinishLabel,decodeCardDetails} from "../../lib/cardDetails";
import BuyNowButton from "../../components/BuyNowButton";

type Listing={id:number;name:string;offeredCard:string;desiredCard:string;notes?:string;user_id?:string|null;photoUrls?:string[];listingType?:"trade"|"sell"|"trade_or_sell";salePriceCents?:number|null};
const giveaway=["Pikachu — PSA 10","Swablu — PSA 9","Giovanni's Exile (Full Art) — PSA 9","Iono's Kilowattrel — PSA 8","Team Rocket's Orbeetle — PSA 9"];
const fanPositions=["0%","25%","50%","75%","100%"];
export default function BrowseMarketplacePage(){
 const[listings,setListings]=useState<Listing[]>([]),[loading,setLoading]=useState(true),[userId,setUserId]=use