############################
## WCS
## Interactive Graphs - Highcharts
## Last updated by H.S. on Sep 25, 2025
############################

rm(list = ls())
library(ggplot2)
library(dplyr)
library(shiny) 
library(highcharter)
library(labelled)

# ---- Load data ----
# Delete setwd when running "deploy.R"!!
# setwd("~/Library/CloudStorage/Dropbox/Shared/Shin-Carlson/code/interactive/WCS_app_highcharts") 
df_cum <- readRDS("WCS_cum_data.Rds")

# Variable options
interest_vars <- c(
  "A1", "A2", "A3",   # Media trust & use
  "newsint",                       # Political interest
  # Grid questions (place/identity perceptions)
  paste0("C1_", 1:6),              # Area of residence (6 items)
  paste0("C2_", 1:9),              # Rural areas (9 items)
  paste0("C3_", 1:6),              # Qualities of residence (6 items)
  paste0("D1_", 1:4),              # Race & racism (4 items)
  # Democratic norms (scales)
  "E1", "E2", "E3", "E4",
  #"E1_dk_flag", "E2_dk_flag", "E3_dk_flag", "E4_dk_flag",
  # Candidate thermometers & choices
  "F1_7", "F1_8",
  paste0("F2_", 1:7),
  "F3", "F4", "F5"
)

moderator_vars <- c(
  # Demographics
  "gender4",  "age4",
  #"birthyr", "age", # too many categories
  "race", "race4", "hispanic",
  "educ", "educ4", "educ2",
  "region", "urbancity", "ownrent",
  "faminc", "employ", 
  "marstat", "child18",
  "pew_religimp", "pew_churatd", "pew_bornagain", "pew_prayer", "religpew",
  
  # Political predispositions
  "ideo5", "ideo3",
  "pid3", "pid7", "pid3_baseline", "pid7_baseline"
)

# Labels for dropdowns (use variable labels instead of names)
interest_choices  <- setNames(interest_vars, sapply(interest_vars, \(v) var_label(df_cum[[v]]) %||% v))
moderator_choices <- setNames(moderator_vars, sapply(moderator_vars, \(v) var_label(df_cum[[v]]) %||% v))

wave_choices <- setNames(
  c("Oct 2023","Feb 2024","May 2024","Oct 2024","Feb 2025","May 2025"),
  1:6
)

# ---- Plotting function ----
plot_bar_highchart <- function(df, var, group_by = NULL, title_prefix = NULL, use_weights = FALSE) {
  var_lbl   <- var_label(df[[var]]);   if (is.null(var_lbl)   || var_lbl   == "") var_lbl   <- var
  group_lbl <- if (!is.null(group_by)) var_label(df[[group_by]]) else NULL
  if (!is.null(group_lbl) && (is.null(group_lbl) || group_lbl == "")) group_lbl <- group_by
  
  # ---- Add group sizes ----
  if (!is.null(group_by)) {
    group_counts <- df %>%
      filter(!is.na(.data[[group_by]])) %>%
      count(!!sym(group_by)) %>%
      rename(N = n)
    
    # Creating a vector for group name + N text
    legend_labels <- paste0(group_counts[[group_by]], " (N=", group_counts$N, ")")
    
    # group name order may not match with df_plot - match by name
    name_map <- setNames(legend_labels, group_counts[[group_by]])
  }
  
#  # ---- Optionally exclude special responses ----
#  if (!is.null(input$exclude_special) && input$exclude_special == "exclude") {
#    df <- df %>%
#      filter(
#        !(.data[[var]] %in% c("Not sure", "Other", "Skipped"))
#      ) }

  # ---- Percentages ----
  if (use_weights && "weight" %in% names(df)) {
    if (is.null(group_by)) {
      df_plot <- df %>%
        filter(!is.na(.data[[var]])) %>%
        group_by(!!sym(var)) %>%
        summarise(wt = sum(weight, na.rm = TRUE), .groups = "drop") %>%
        mutate(pct = 100 * wt / sum(wt, na.rm = TRUE))
      categories <- as.character(df_plot[[var]])
      N <- sum(df$weight, na.rm = TRUE)
    } else {
      df_plot <- df %>%
        filter(!is.na(.data[[var]]), !is.na(.data[[group_by]])) %>%
        group_by(!!sym(group_by), !!sym(var)) %>%
        summarise(wt = sum(weight, na.rm = TRUE), .groups = "drop_last") %>%
        mutate(pct = 100 * wt / sum(wt, na.rm = TRUE)) %>%
        ungroup()
      categories <- as.character(unique(df_plot[[var]]))
      N <- sum(df$weight, na.rm = TRUE)
    }
  } else {
    if (is.null(group_by)) {
      df_plot <- df %>%
        filter(!is.na(.data[[var]])) %>%
        count(!!sym(var), .drop = TRUE) %>%
        mutate(pct = 100 * n / sum(n, na.rm = TRUE))
      categories <- as.character(df_plot[[var]])
      N <- nrow(df)
    } else {
      df_plot <- df %>%
        filter(!is.na(.data[[var]]), !is.na(.data[[group_by]])) %>%
        count(!!sym(group_by), !!sym(var), .drop = TRUE) %>%
        group_by(!!sym(group_by)) %>%
        mutate(pct = 100 * n / sum(n, na.rm = TRUE)) %>%
        ungroup()
      categories <- as.character(unique(df_plot[[var]]))
      N <- nrow(df)
    }
  }
  
  # ---- Color palettes ----
  party_colors7 <- c("Strong Democrat"="#08306B","Not very strong Democrat"="#2171B5",
                     "Lean Democrat"="#6BAED6","Independent"="#BDBDBD",
                     "Lean Republican"="#FC9272","Not very strong Republican"="#FB6A4A",
                     "Strong Republican"="#CB181D","Not sure"="#969696")
  party_colors3 <- c("Democrat"="#2171B5","Republican"="#CB181D",
                     "Independent"="#BDBDBD","Other"="#969696","Not sure"="#737373")
  ideo_colors5 <- c("Very liberal"="#08306B", "Liberal"="#6BAED6","Moderate"="#BDBDBD",
                     "Conservative"="#FC9272", "Very conservative"="#CB181D", "Not sure"="#969696","Skipped"="gray20")
  ideo_colors3 <- c("Liberal"="#2171B5","Moderate"="#BDBDBD","Conservative"="#CB181D",
                     "Not sure"="#737373", "Skipped"="#969696")
  okabe_ito <- c("#E69F00","#56B4E9","#009E73","#F0E442",
                 "#0072B2","#D55E00","#CC79A7","#999999")
  
  pick_colors <- function() {
    if (is.null(group_by)) return(NULL)
    lv <- unique(df_plot[[group_by]])
    if (group_by == "pid7") return(unname(party_colors7[lv]))
    if (group_by == "pid7_baseline") return(unname(party_colors7[lv]))
    if (group_by == "pid3") return(unname(party_colors3[lv]))
    if (group_by == "pid3_baseline") return(unname(party_colors3[lv]))
    if (group_by == "ideo5") return(unname(ideo_colors5[lv]))
    if (group_by == "ideo3") return(unname(ideo_colors3[lv]))
    okabe_ito
  }
  
  # ---- Highcharts ----
  title_text <- paste0(title_prefix, ": ", var_lbl, 
                       if (!is.null(group_lbl)) paste(" by ", group_lbl) else "")
  subtitle_text <- paste0("N=", format(N, big.mark=","))  # 👈 gray subtitle
  
  if (is.null(group_by)) {
    hc <- hchart(df_plot, "column",
                 hcaes(x = !!sym(var), y = pct),
                 name = "Percentage") %>%
      hc_title(text = title_text) %>%
      hc_subtitle(text = subtitle_text, style = list(color = "#666666", fontSize = "12px")) %>%
      hc_yAxis(title = list(text = "Percentage"),
               labels = list(format = "{value}%"),
               max = 100, min = 0) %>%
      hc_xAxis(title = list(text = var_lbl),
               categories = categories) %>%
      hc_plotOptions(column = list(dataLabels = list(enabled = TRUE, format = "{point.y:.0f}%"))) %>%
      hc_tooltip(pointFormat = "<b>{point.y:.1f}%</b>")
    # ---- Grouped case ----
  } else {
    # ---- Add group sizes ----
    group_counts <- df %>%
      filter(!is.na(.data[[group_by]])) %>%
      count(!!sym(group_by)) %>%
      rename(N = n)
    legend_labels <- paste0(group_counts[[group_by]], " (N=", group_counts$N, ")")
    name_map <- setNames(legend_labels, group_counts[[group_by]])
    df_plot[[group_by]] <- factor(df_plot[[group_by]],
                                  levels = names(name_map),
                                  labels = name_map)
    
    hc <- hchart(df_plot, "column",
                 hcaes(x = !!sym(var), y = pct, group = !!sym(group_by))) %>%
      hc_title(text = title_text) %>%
      hc_subtitle(text = subtitle_text, style = list(color = "#666666", fontSize = "12px")) %>%
      hc_yAxis(title = list(text = "Percentage"),
               labels = list(format = "{value}%"),
               max = 100, min = 0) %>%
      hc_xAxis(title = list(text = var_lbl),
               categories = categories) %>%
      hc_legend(title = list(text = group_lbl),
                align = "center", verticalAlign = "bottom",
                itemStyle = list(fontSize = "12px")) %>%
      hc_plotOptions(column = list(dataLabels = list(enabled = TRUE, format = "{point.y:.0f}%"))) %>%
      hc_tooltip(pointFormat = "{series.name}: <b>{point.y:.1f}%</b>")
    cols <- pick_colors(); if (!is.null(cols)) hc <- hc %>% hc_colors(cols)
  }
  return(hc)
}

# ---- UI ----
ui <- fluidPage(
  titlePanel("Weidenbaum Center Survey (WCS) Dashboard"),
  sidebarLayout(
    sidebarPanel(
      radioButtons("mode", "Select Mode:",
                   choices = c("Single Wave" = "single", "Compare Two Waves" = "compare"),
                   selected = "single"),
      checkboxInput("weighted", "Use survey weights", value = FALSE),
      radioButtons(
        "exclude_special",
        "Responses to include:",
        choices = c(
          "All responses" = "all",
          "Exclude 'Not sure / Other / Skipped'" = "exclude"
        ),
        selected = "all"
      ),
      
      conditionalPanel(
        condition = "input.mode == 'single'",
        selectInput(
          "wave", "Select Wave:",
          choices = c(
            "All Waves", 
            setNames(
              names(wave_choices),   # actual value: wave (1-6)
              paste0("Wave ", names(wave_choices), " (", wave_choices, ")")  # displayed text
            )
          )
        )
      ),
      conditionalPanel(
        condition = "input.mode == 'compare'",
        selectInput(
          "wave1", "Select Wave 1:",
          choices = setNames(
            names(wave_choices),
            paste0("Wave ", names(wave_choices), " (", wave_choices, ")")
          )
        ),
        selectInput(
          "wave2", "Select Wave 2:",
          choices = setNames(
            names(wave_choices),
            paste0("Wave ", names(wave_choices), " (", wave_choices, ")")
          )
        )
      ),
      selectInput("var", "Select Interest Variable:", choices = interest_choices),
      selectInput("moderator", "Select Moderator:", choices = c("None" = "None", moderator_choices))
    ),
    
    mainPanel(uiOutput("plot_ui"))
  )
)

# ---- SERVER ----
server <- function(input, output, session) {
  
  # ✅ Dynamic UI: show plot + question text below
  output$plot_ui <- renderUI({
    if (input$mode == "single") {
      # question wording
      q_text <- attr(df_cum[[input$var]], "question")
      if (is.null(q_text) || q_text == "") q_text <- "(No question wording available)"
      
      tagList(
        highchartOutput("plot_single", height = "600px"),
        br(),
        tags$div(
          style = "margin-top: 10px; padding: 10px 15px; background-color: #fafafa;
           border-top: 1px solid #ddd; font-size: 14px; line-height: 1.6;",
          tags$b("Question: "),
          attr(df_cum[[input$var]], "question")
        )
        
      )
      
    } else {
      # Compare mode
      tagList(
        fluidRow(
          column(6, highchartOutput("plot_wave1", height = "600px")),
          column(6, highchartOutput("plot_wave2", height = "600px"))
        ),
        br(),
        tags$div(
          HTML(paste0("<b>Question:</b> ", attr(df_cum[[input$var]], "question"))),
          style = "font-size: 15px; color: #444; margin-top: 8px; margin-left: 10px;"
        )
      )
    }
  })
  
  
  # Single wave plot (with All Waves option)
  output$plot_single <- renderHighchart({
    req(input$mode == "single")
    
    if (input$wave == "All Waves") {
      df_wave <- df_cum
      wave_label <- "All Waves"
    } else {
      df_wave <- df_cum %>% filter(wave == input$wave)
      wave_label <- paste("Wave", input$wave)
    }
    
    # ✅ Apply exclusion filter regardless of wave selection
    if (input$exclude_special == "exclude") {
      exclude_vals <- c("Not sure", "Other", "Skipped")
      
      vars_to_check <- c(input$var)
      if (input$moderator != "None") {
        vars_to_check <- c(vars_to_check, input$moderator)
      }
      
      df_wave <- df_wave %>%
        filter(
          across(all_of(vars_to_check),
                 ~ !(.x %in% exclude_vals) | is.na(.x))
        )
    }
    
    mod <- if (input$moderator == "None") NULL else input$moderator
    plot_bar_highchart(df_wave, var = input$var, group_by = mod,
                       title_prefix = wave_label,
                       use_weights = input$weighted)
  })
  
  # Two wave comparison (unchanged)
  output$plot_wave1 <- renderHighchart({
    req(input$mode == "compare")
    df_wave <- df_cum %>% filter(wave == input$wave1)
    # Exclude "Not sure", "Other", "Skipped" if selected
    if (input$exclude_special == "exclude") {
      exclude_vals <- c("Not sure", "Other", "Skipped")
      
      vars_to_check <- c(input$var)
      if (input$moderator != "None") {
        vars_to_check <- c(vars_to_check, input$moderator)
      }
      
      df_wave <- df_wave %>%
        filter(
          across(all_of(vars_to_check),
                 ~ !(.x %in% exclude_vals) | is.na(.x))
        )
    }
    
    
    mod <- if (input$moderator == "None") NULL else input$moderator
    plot_bar_highchart(df_wave, var = input$var, group_by = mod,
                       title_prefix = paste("Wave", input$wave1),
                       use_weights = input$weighted)
  })
  
  output$plot_wave2 <- renderHighchart({
    req(input$mode == "compare")
    df_wave <- df_cum %>% filter(wave == input$wave2)
    # Exclude "Not sure", "Other", "Skipped" if selected
    if (input$exclude_special == "exclude") {
      exclude_vals <- c("Not sure", "Other", "Skipped")
      
      vars_to_check <- c(input$var)
      if (input$moderator != "None") {
        vars_to_check <- c(vars_to_check, input$moderator)
      }
      
      df_wave <- df_wave %>%
        filter(
          across(all_of(vars_to_check),
                 ~ !(.x %in% exclude_vals) | is.na(.x))
        )
    }
    
    
    mod <- if (input$moderator == "None") NULL else input$moderator
    plot_bar_highchart(df_wave, var = input$var, group_by = mod,
                       title_prefix = paste("Wave", input$wave2),
                       use_weights = input$weighted)
  })
}

# ---- Run app ----
shinyApp(ui, server)
