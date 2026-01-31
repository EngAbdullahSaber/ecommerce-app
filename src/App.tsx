// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLanguage } from "./hooks/useLanguage";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UpdateOrderPage from "./pages/orders/UpdateOrder";
import CreateOrderPage from "./pages/orders/CreateOrder";
import OrdersPage from "./pages/orders/OrdersPage";
import ViewOrderPage from "./pages/orders/ViewOrder";
import {
  ProtectedRoute,
  PublicRoute,
} from "./components/common/ProtectedRoute/ProtectedRoute";
import ToastProvider from "./components/common/ToastProvider/ToastProvider";
import CountriesPage from "./pages/Countries/CountriesPage";
import CreateCountryPage from "./pages/Countries/CreateCountryPage";
import UpdateCountryPage from "./pages/Countries/UpdateCountryPage";
import CitiesPage from "./pages/Cities/CitiesPage";
import CreateCitiesPage from "./pages/Cities/CreateCitiesPage";
import UpdateCitiesPage from "./pages/Cities/UpdateCitiesPage";
import AreasPage from "./pages/Areas/AreasPage";
import CreateAreaPage from "./pages/Areas/CreateAreaPage";
import UpdateAreaPage from "./pages/Areas/UpdateAreaPage";
import EventsPage from "./pages/Events/EventsPage";
import CreateEventPage from "./pages/Events/CreateEventPage";
import StoresPage from "./pages/Stores/StoresPage";
import CreateStoresPage from "./pages/Stores/CreateStoresPage";
import UpdateStoresPage from "./pages/Stores/UpdateStoresPage";
import CreateStorePage from "./pages/Stores/CreateStoresPage";
import UpdateStorePage from "./pages/Stores/UpdateStoresPage";
import UpdateEventPage from "./pages/Events/UpdateEventPage";
import BrandsPage from "./pages/Brands/BrandsPage";
import CreateBrandPage from "./pages/Brands/CreateBrandPage";
import UpdateBrandPage from "./pages/Brands/UpdateBrandPage";
import MerchantsPage from "./pages/Merchants/MerchantsPage";
import CreateMerchantPage from "./pages/Merchants/CreateMerchantPage";
import UpdateMerchantPage from "./pages/Merchants/UpdateMerchantPage";
import CreateParentCategoryPage from "./pages/Category/ParentCategory/CreateParentCategoryPage";
import ParentCategoriesPage from "./pages/Category/ParentCategory/ParentCategoryPage";
import SubCategoryPage from "./pages/Category/SubCategory/SubCategoryPage";
import CreateSubCategoryPage from "./pages/Category/SubCategory/CreateSubCategoryPage";
import CreateThirdCategoryPage from "./pages/Category/ThirdCategory/CreateThirdCategoryPage";
import UpdateParentCategoryPage from "./pages/Category/ParentCategory/UpdateParentCategoryPage";
import UpdateSubCategoryPage from "./pages/Category/SubCategory/UpdateSubCategoryPage";
import UpdateThirdCategoryPage from "./pages/Category/ThirdCategory/UpdateThirdCategoryPage";
import ThirdCategoriesPage from "./pages/Category/ThirdCategory/ThirdCategoriesPage";
import BannersPage from "./pages/Banners/BannersPage";
import CreateBannerPage from "./pages/Banners/CreateBannerPage";
import UpdateBannerPage from "./pages/Banners/UpdateBrandPage";
import FiltersPage from "./pages/Filters/FiltersPage";
import CreateFilterPage from "./pages/Filters/CreateFilterPage";
import UpdateFilterPage from "./pages/Filters/UpdateFilterPage";
import ViewFilterPage from "./pages/Filters/ViewFilterPage";
import ProductsPage from "./pages/Products/ProductsPage";
import ViewProductPage from "./pages/Products/ViewProductPage";
import CreateProductPage from "./pages/Products/CreateProductPage";
import UpdateProductPage from "./pages/Products/UpdateProductPage";
import PromoRulesPage from "./pages/PromoRules/PromoRulesPage";
import CreatePromoRules from "./pages/PromoRules/CreatePromoRules";
import UpdatePromoRules from "./pages/PromoRules/UpdatePromoRules";

export default function App() {
  useLanguage();

  return (
    <>
      {/* Toast Provider Component */}
      <ToastProvider />

      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Home />} />
            <Route path="profile" element={<UserProfiles />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="blank" element={<Blank />} />
            <Route path="form-elements" element={<FormElements />} />
            <Route path="orders" element={<OrdersPage />} />

            <Route path="Countries" element={<CountriesPage />} />
            <Route path="countries/create" element={<CreateCountryPage />} />
            <Route path="Countries/edit/:id" element={<UpdateCountryPage />} />

            <Route path="Cities" element={<CitiesPage />} />
            <Route path="Cities/create" element={<CreateCitiesPage />} />
            <Route path="Cities/edit/:id" element={<UpdateCitiesPage />} />

            <Route path="Areas" element={<AreasPage />} />
            <Route path="Areas/create" element={<CreateAreaPage />} />
            <Route path="Areas/edit/:id" element={<UpdateAreaPage />} />

            <Route path="Events" element={<EventsPage />} />
            <Route path="Events/create" element={<CreateEventPage />} />
            <Route path="Events/edit/:id" element={<UpdateEventPage />} />

            <Route path="Stores" element={<StoresPage />} />
            <Route path="Stores/create" element={<CreateStorePage />} />
            <Route path="Stores/edit/:id" element={<UpdateStorePage />} />

            <Route path="Brands" element={<BrandsPage />} />
            <Route path="Brands/create" element={<CreateBrandPage />} />
            <Route path="Brands/edit/:id" element={<UpdateBrandPage />} />

            <Route path="Merchants" element={<MerchantsPage />} />
            <Route path="Merchants/create" element={<CreateMerchantPage />} />
            <Route path="Merchants/edit/:id" element={<UpdateMerchantPage />} />

            <Route
              path="parent-categories"
              element={<ParentCategoriesPage />}
            />
            <Route
              path="parent-categories/create"
              element={<CreateParentCategoryPage />}
            />
            <Route
              path="parent-categories/edit/:id"
              element={<UpdateParentCategoryPage />}
            />

            <Route path="sub-categories" element={<SubCategoryPage />} />
            <Route
              path="sub-categories/create"
              element={<CreateSubCategoryPage />}
            />
            <Route
              path="sub-categories/edit/:id"
              element={<UpdateSubCategoryPage />}
            />

            <Route path="third-categories" element={<ThirdCategoriesPage />} />
            <Route
              path="third-categories/create"
              element={<CreateThirdCategoryPage />}
            />
            <Route
              path="third-categories/edit/:id"
              element={<UpdateThirdCategoryPage />}
            />

            <Route path="Banners" element={<BannersPage />} />
            <Route path="Banners/create" element={<CreateBannerPage />} />
            <Route path="Banners/edit/:id" element={<UpdateBannerPage />} />

            <Route path="filters" element={<FiltersPage />} />
            <Route path="filters/create" element={<CreateFilterPage />} />
            <Route path="filters/edit/:id" element={<UpdateFilterPage />} />
            <Route path="filters/view/:id" element={<ViewFilterPage />} />

            <Route path="products" element={<ProductsPage />} />
            <Route path="products/create" element={<CreateProductPage />} />
            <Route path="products/edit/:id" element={<UpdateProductPage />} />
            <Route path="products/view/:id" element={<ViewProductPage />} />

            <Route path="promo-rules" element={<PromoRulesPage />} />
            <Route path="promo-rules/create" element={<CreatePromoRules />} />
            <Route path="promo-rules/edit/:id" element={<UpdatePromoRules />} />
            {/* <Route path="promo-rules/view/:id" element={<ViewPromoRulePage />} /> */}

            <Route path="create-order" element={<CreateOrderPage />} />
            <Route path="update-order/:id" element={<UpdateOrderPage />} />
            <Route path="view-order/:id" element={<ViewOrderPage />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
