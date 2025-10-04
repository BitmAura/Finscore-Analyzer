-- Create a stored procedure to increment user analysis count
CREATE OR REPLACE FUNCTION public.increment_user_analyses(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, check if the user has a stats record
  IF NOT EXISTS (SELECT 1 FROM public.user_dashboard_stats WHERE user_id = increment_user_analyses.user_id) THEN
    -- Create a new stats record if none exists
    INSERT INTO public.user_dashboard_stats (user_id)
    VALUES (increment_user_analyses.user_id);
  END IF;

  -- Now increment the analysis counts
  UPDATE public.user_dashboard_stats
  SET
    total_analyses = total_analyses + 1,
    this_month = this_month + 1,
    processing_queue = processing_queue + 1,
    updated_at = NOW()
  WHERE user_id = increment_user_analyses.user_id;
END;
$$;
